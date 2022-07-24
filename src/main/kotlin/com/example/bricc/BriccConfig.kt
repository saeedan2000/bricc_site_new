package com.example.bricc

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding


data class Time(
    val hour: Int,
    val minutes: Int
)

data class SpecialTime(
    val date: String,
    val startTime: Time,
    val numHours: Int
)

@ConstructorBinding
@ConfigurationProperties(prefix = "bricc.config")
data class BriccConfig(
    val startTime: Time,
    val numHours: Int,
    val specialTimings: List<SpecialTime>
)
