package com.example.demo.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.Entity.Paciente;

public interface PacienteRepository extends JpaRepository<Paciente, Integer> {
}