package com.asdarr.bricc

import org.springframework.stereotype.Service

enum class LaneType {
    INDOOR,
    OUTDOOR
}

data class Lane(
    val num: Int,
    val type: LaneType
)

data class HourlyAvailability(
    val hour: Int,
    val availableLanes: List<Lane>
)
@Service
class AvailabilityService(
    private val config: BriccConfig,
    private val laneInfo: LaneInfo, // using this instead of repo so that we can avoid unnecessary db call
    private val resRepo: ReservationRepository
) {
    fun getAvailablity(day: String, numHours: Int): List<HourlyAvailability> {
        val lanes = laneInfo.lanes

        return emptyList()
    }
}