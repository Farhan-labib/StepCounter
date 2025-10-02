package com.farhan.stepcounterapp

data class StepData(
    val timestamp: Long,
    val stepCount: Int,
    val userId: String = "user001"
)
