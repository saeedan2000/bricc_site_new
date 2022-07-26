package com.asdarr.bricc

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

data class Time(
    val hours: Int,
    val minutes: Int
)

data class Date(
    val year: String,
    val month: String,
    val date: String
)

data class SpecialTime(
    val date: Date,
    val startTime: Time,
    val numHours: Int
)

data class Announcement(
    val subject: String,
    val text: String
)

@ConstructorBinding
@ConfigurationProperties(prefix = "bricc.config")
data class BriccConfig(
    val startTime: Time,
    val numHours: Int,
    val minStartTimeInterval: Int,
    val numLanes: Int,
    val specialTimings: List<SpecialTime>
)
