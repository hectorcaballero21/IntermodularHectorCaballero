package com.example.demo.Services;

import java.util.List;

import com.example.demo.Entity.Cita;

public interface CitaService {

    List<Cita> listar();

    Cita guardar(Cita cita);

    Cita actualizar(Integer id, Cita cita);

    Cita obtenerPorId(Integer id);

    void eliminar(Integer id);
}