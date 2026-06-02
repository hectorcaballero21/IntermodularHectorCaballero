package com.example.demo.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.Entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
}