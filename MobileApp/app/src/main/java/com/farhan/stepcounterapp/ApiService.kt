package com.farhan.stepcounterapp

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {
    @POST("/api/steps")
    suspend fun sendStepData(@Body stepData: StepData): Response<Void>
}
