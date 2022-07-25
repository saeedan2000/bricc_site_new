package com.asdarr.bricc

import org.springframework.web.bind.annotation.*
import org.springframework.web.bind.annotation.RestController

data class TimeWithAvailability(
    val hours: Int,
    val minutes: Int,
    val isAvailable: Boolean
)

data class Date(
    val year: String,
    val month: String,
    val date: String
)

data class TimesPostBody(
    val date: Date,
    val numLanes: Int,
    val numHours: Int
)

@RestController
@RequestMapping("/api")
class RestController(
    private val config: BriccConfig
    ) {

    @GetMapping("/init")
    fun initialInfo(): BriccConfig {
        return config
    }

    @PostMapping("/times")
    fun startTimes(@RequestBody body: TimesPostBody): List<TimeWithAvailability> {
        val ret: MutableList<TimeWithAvailability> = mutableListOf()
        var start = timeToMinutes(config.startTime)
        var numHours = config.numHours
        val todayString = body.date.let { "${it.year}-${it.month}-${it.date}" }
        config.specialTimings.forEach { t ->
            if (t.date == todayString) {
                start = timeToMinutes(t.startTime)
                numHours = t.numHours
            }
        }
        while(start < start + (numHours * 60)) {
            ret.add(
                TimeWithAvailability(
                    hours = start / 60,
                    minutes = start % 60,
                    isAvailable = true
                )
            )
        }
        // TODO check database for availability
        return ret;
    }
}

fun timeToMinutes(time: Time): Int = (time.hours * 60) + time.minutes
