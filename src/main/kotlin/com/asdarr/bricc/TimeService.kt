package com.asdarr.bricc

import org.springframework.stereotype.Service

data class TimeWithAvailability(
    val hours: Int,
    val minutes: Int,
    val isAvailable: Boolean
)

@Service
class TimeService(
    private val config: BriccConfig
) {
    fun getAvailableStartTimes(input: TimesPostBody): List<TimeWithAvailability> {
        val ret: MutableList<TimeWithAvailability> = mutableListOf()
        var start = timeToMinutes(config.startTime)
        var numHours = config.numHours

        // If the date matches up with one of our special timings,
        config.specialTimings.forEach { s ->
            if (s.date == input.date) {
                start = timeToMinutes(s.startTime)
                numHours = s.numHours
            }
        }
        var cur = start
        while(cur < start + (numHours * 60)) {
            ret.add(
                TimeWithAvailability(
                    hours = cur / 60,
                    minutes = cur % 60,
                    isAvailable = true
                )
            )
            cur += config.minStartTimeInterval
        }
        // TODO check database for availability
        val todayString = input.date.let { "${it.year}-${it.month}-${it.date}" }
        return ret;
    }
}