package com.asdarr.bricc

import org.springframework.stereotype.Component

@Component
class LaneInfo(
    private val laneRepo: LaneRepository
)
{
    val lanes = laneRepo.getAllLanes()
}