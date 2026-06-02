package com.example.demo.Services;

import java.util.List;

import com.example.demo.Entity.Paciente;

public interface PacienteService {

    List<Paciente> listar();

    Paciente guardar(Paciente paciente);

    Paciente actualizar(Integer id, Paciente paciente);

    Paciente obtenerPorId(Integer id);

    void eliminar(Integer id);
}
