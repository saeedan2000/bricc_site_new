package com.asdarr.bricc

import org.springframework.web.bind.annotation.*
import org.springframework.web.bind.annotation.RestController

data class AvailabilityPostBody(
    val date: String,
    val numHours: Int
)

@RestController
@RequestMapping("/api")
class RestController(
    private val initService: InitService,
    private val availService: AvailabilityService
    ) {

    @GetMapping("/init")
    fun initInfo(): InitInfo {
        return initService.getInitInfo()
    }

    /**
     * Given a date and a number of hours, we return all available lanes for each hour.
     */
    @PostMapping("/availability")
    fun availability(@RequestBody body: AvailabilityPostBody): List<HourlyAvailability> {
        return availService.getAvailablity(body.date, body.numHours)
    }
}