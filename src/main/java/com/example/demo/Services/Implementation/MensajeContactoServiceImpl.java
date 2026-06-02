package com.example.demo.Services.Implementation;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.Entity.MensajeContacto;
import com.example.demo.Repository.MensajeContactoRepository;
import com.example.demo.Services.MensajeContactoService;

@Service
public class MensajeContactoServiceImpl implements MensajeContactoService {

    @Autowired
    private MensajeContactoRepository repository;

    @Override
    public List<MensajeContacto> listar() {
        return repository.findAll();
    }

    @Override
    public MensajeContacto guardar(MensajeContacto mensaje) {
        return repository.save(mensaje);
    }

    @Override
    public MensajeContacto obtenerPorId(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public MensajeContacto marcarComoLeido(Long id) {
        MensajeContacto mensaje = obtenerPorId(id);

        if (mensaje == null) {
            return null;
        }

        mensaje.setLeido(true);
        return repository.save(mensaje);
    }

    @Override
    public MensajeContacto responder(Long id, String respuesta) {
        MensajeContacto mensaje = obtenerPorId(id);

        if (mensaje == null) {
            return null;
        }

        mensaje.setRespuesta(respuesta);
        mensaje.setFechaRespuesta(LocalDateTime.now());
        mensaje.setLeido(true);

        return repository.save(mensaje);
    }

    @Override
    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}
