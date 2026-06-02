package com.example.demo.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.Entity.Cita;

public interface CitaRepository extends JpaRepository<Cita, Integer> {
}