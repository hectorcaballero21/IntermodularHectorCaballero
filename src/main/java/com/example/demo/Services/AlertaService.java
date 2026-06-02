package com.example.demo.Services;

import java.util.List;

import com.example.demo.Entity.Alerta;

public interface AlertaService {

    List<Alerta> listar();

    Alerta guardar(Alerta alerta);

    Alerta obtenerPorId(Integer id);

    Alerta actualizar(Integer id, Alerta alerta);

    void eliminar(Integer id);
}
