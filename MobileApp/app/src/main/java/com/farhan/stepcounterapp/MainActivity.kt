package com.farhan.stepcounterapp

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : ComponentActivity(), SensorEventListener {


    private lateinit var tvStepCount: TextView
    private lateinit var tvStatus: TextView
    private lateinit var btnStartStop: Button


    private lateinit var sensorManager: SensorManager
    private var stepSensor: Sensor? = null


    private var isTracking = false
    private var currentSteps = 0
    private var initialSteps = -1


    private lateinit var localStorage: LocalStorage


    private var uploadJob: Job? = null


    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            Toast.makeText(this, "Permission granted!", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(this, "Permission denied. App won't work properly.", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)


        tvStepCount = findViewById(R.id.tvStepCount)
        tvStatus = findViewById(R.id.tvStatus)
        btnStartStop = findViewById(R.id.btnStartStop)


        localStorage = LocalStorage(this)


        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        stepSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)


        if (stepSensor == null) {
            tvStatus.text = "Status: Step Counter not available on this device"
            btnStartStop.isEnabled = false
            Toast.makeText(this, "Step Counter sensor not found!", Toast.LENGTH_LONG).show()
        }


        requestActivityRecognitionPermission()


        btnStartStop.setOnClickListener {
            if (isTracking) {
                stopTracking()
            } else {
                startTracking()
            }
        }
    }

    private fun requestActivityRecognitionPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.ACTIVITY_RECOGNITION
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                requestPermissionLauncher.launch(Manifest.permission.ACTIVITY_RECOGNITION)
            }
        }
    }

    private fun startTracking() {
        if (stepSensor != null) {
            isTracking = true
            initialSteps = -1
            btnStartStop.text = "Stop Tracking"
            tvStatus.text = "Status: Tracking..."


            sensorManager.registerListener(
                this,
                stepSensor,
                SensorManager.SENSOR_DELAY_NORMAL
            )


            startPeriodicUpload()

            Toast.makeText(this, "Tracking started", Toast.LENGTH_SHORT).show()
        }
    }

    private fun stopTracking() {
        isTracking = false
        btnStartStop.text = "Start Tracking"
        tvStatus.text = "Status: Stopped"


        sensorManager.unregisterListener(this)


        uploadJob?.cancel()

        Toast.makeText(this, "Tracking stopped", Toast.LENGTH_SHORT).show()
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event?.sensor?.type == Sensor.TYPE_STEP_COUNTER) {
            val totalSteps = event.values[0].toInt()


            if (initialSteps == -1) {
                initialSteps = totalSteps
            }


            currentSteps = totalSteps - initialSteps


            runOnUiThread {
                tvStepCount.text = "Steps: $currentSteps"
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {

    }

    private fun startPeriodicUpload() {
        uploadJob = CoroutineScope(Dispatchers.Main).launch {
            while (isTracking) {
                delay(5000)
                uploadStepData()
            }
        }
    }

    private suspend fun uploadStepData() {
        val stepData = StepData(
            timestamp = System.currentTimeMillis(),
            stepCount = currentSteps
        )


        localStorage.saveStepData(stepData)


        withContext(Dispatchers.IO) {
            try {
                val response = RetrofitClient.apiService.sendStepData(stepData)

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        tvStatus.text = "Status: Data uploaded ✓"
                    } else {
                        tvStatus.text = "Status: Upload failed (saved locally)"
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    tvStatus.text = "Status: No connection (saved locally)"
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        sensorManager.unregisterListener(this)
        uploadJob?.cancel()
    }

    private fun runOnUiThread(action: () -> Unit) {
        if (Thread.currentThread() == mainLooper.thread) {
            action()
        } else {
            CoroutineScope(Dispatchers.Main).launch {
                action()
            }
        }
    }
}