package com.asdarr.bricc

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import org.springframework.data.repository.CrudRepository

// Column and Table annotations are used where the naming scheme doesn't match the actual database.
// This is because I decided to use lowercase with underscores in the database to exercise the mind.
@Table("reservations")
data class ReservationEntry(
    @Id
    val id: Long,
    val date: String,

    @Column("start_time")
    val startTime: Int,

    @Column("num_hours")
    val numHours: Int,
    val lane: Int,

    @Column("customer_id")
    val customerId: Long
)

interface ReservationRepository : CrudRepository<ReservationEntry, Long> {

}
