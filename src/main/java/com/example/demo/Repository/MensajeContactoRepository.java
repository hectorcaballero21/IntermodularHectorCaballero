package com.example.demo.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.Entity.MensajeContacto;

public interface MensajeContactoRepository extends JpaRepository<MensajeContacto, Long> {
}
