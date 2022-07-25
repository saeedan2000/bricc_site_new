package com.asdarr.bricc

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

data class Announcement(
    val subject: String,
    val text: String
)

@ConstructorBinding
@ConfigurationProperties(prefix = "bricc.config")
data class BriccConfig(
    val startTime: Time,
    val numHours: Int,
    val numLanes: Int,
    val specialTimings: List<SpecialTime>,
    val announcements: List<Announcement>
)
