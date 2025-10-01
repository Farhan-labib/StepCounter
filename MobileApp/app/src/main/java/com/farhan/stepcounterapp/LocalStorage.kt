package com.farhan.stepcounterapp

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.io.File

class LocalStorage(private val context: Context) {
    private val fileName = "step_data.json"
    private val gson = Gson()

    fun saveStepData(stepData: StepData) {
        val dataList = getAllStepData().toMutableList()
        dataList.add(stepData)

        val jsonString = gson.toJson(dataList)
        File(context.filesDir, fileName).writeText(jsonString)
    }

    fun getAllStepData(): List<StepData> {
        val file = File(context.filesDir, fileName)
        if (!file.exists()) return emptyList()

        val jsonString = file.readText()
        val type = object : TypeToken<List<StepData>>() {}.type
        return gson.fromJson(jsonString, type) ?: emptyList()
    }

    fun clearSentData() {
        File(context.filesDir, fileName).writeText("[]")
    }
}