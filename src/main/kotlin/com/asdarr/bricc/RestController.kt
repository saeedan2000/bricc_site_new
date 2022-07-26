package com.asdarr.bricc

import org.springframework.web.bind.annotation.*
import org.springframework.web.bind.annotation.RestController


data class TimesPostBody(
    val date: Date,
    val numLanes: Int,
    val numHours: Int
)

@RestController
@RequestMapping("/api")
class RestController(
    private val config: BriccConfig,
    private val timeService: TimeService
    ) {

    @GetMapping("/init")
    fun initialInfo(): BriccConfig {
        return config
    }

    @PostMapping("/availability")
    fun availableStartTimes(@RequestBody body: TimesPostBody): List<TimeWithAvailability> {
        return timeService.getAvailableStartTimes(body)
    }
}

fun timeToMinutes(time: Time): Int = (time.hours * 60) + time.minutes
