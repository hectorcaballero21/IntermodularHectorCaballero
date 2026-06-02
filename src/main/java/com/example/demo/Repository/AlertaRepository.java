package com.example.demo.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.Entity.Alerta;

public interface AlertaRepository extends JpaRepository<Alerta, Integer> {
}
