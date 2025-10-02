package com.farhan.stepcounterapp

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.io.File

data class SavedStep(
    val dayStart: Long,
    val initialSteps: Int,
    val stepCount: Int
)

class LocalStorage(private val context: Context) {
    private val fileName = "step_data.json"
    private val gson = Gson()

    fun saveStepData(savedStep: SavedStep) {
        val dataList = getAllStepData().toMutableList()
        val today = savedStep.dayStart
        val existingIndex = dataList.indexOfFirst { it.dayStart == today }
        if (existingIndex != -1) dataList[existingIndex] = savedStep
        else dataList.add(savedStep)
        File(context.filesDir, fileName).writeText(gson.toJson(dataList))
    }

    fun getAllStepData(): List<SavedStep> {
        val file = File(context.filesDir, fileName)
        if (!file.exists()) return emptyList()
        val jsonString = file.readText()
        val type = object : TypeToken<List<SavedStep>>() {}.type
        return gson.fromJson(jsonString, type) ?: emptyList()
    }

    fun getTodayStep(): SavedStep? {
        val today = System.currentTimeMillis().toDayStart()
        return getAllStepData().find { it.dayStart == today }
    }
}

fun Long.toDayStart(): Long {
    val cal = java.util.Calendar.getInstance()
    cal.timeInMillis = this
    cal.set(java.util.Calendar.HOUR_OF_DAY, 0)
    cal.set(java.util.Calendar.MINUTE, 0)
    cal.set(java.util.Calendar.SECOND, 0)
    cal.set(java.util.Calendar.MILLISECOND, 0)
    return cal.timeInMillis
}
