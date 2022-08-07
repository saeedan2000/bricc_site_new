package com.asdarr.bricc

import org.springframework.context.annotation.Bean
import org.springframework.data.annotation.Id
import org.springframework.data.jdbc.repository.query.Query
import org.springframework.data.relational.core.mapping.Table
import org.springframework.data.repository.Repository

@Table("lanes")
data class LaneEntry(
    @Id
    val id: Long,
    val num: Int,
    val type: String
)

interface LaneRepository: Repository<LaneEntry, Long> {
    @Query("SELECT * FROM bricc_schema.lanes")
    fun getAllLanes(): List<LaneEntry>
}