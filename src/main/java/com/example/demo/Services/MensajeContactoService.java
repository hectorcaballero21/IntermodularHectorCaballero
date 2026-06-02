package com.example.demo.Services;

import java.util.List;

import com.example.demo.Entity.MensajeContacto;

public interface MensajeContactoService {

    List<MensajeContacto> listar();

    MensajeContacto guardar(MensajeContacto mensaje);

    MensajeContacto obtenerPorId(Long id);

    MensajeContacto marcarComoLeido(Long id);

    MensajeContacto responder(Long id, String respuesta);

    void eliminar(Long id);
}
