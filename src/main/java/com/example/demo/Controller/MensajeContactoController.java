package com.example.demo.Controller;

import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Entity.MensajeContacto;
import com.example.demo.Services.MensajeContactoService;

@RestController
@RequestMapping("/mensajes-contacto")
@CrossOrigin(origins = "*")
public class MensajeContactoController {

    @Autowired
    private MensajeContactoService service;

    @GetMapping
    public List<MensajeContacto> listar() {
        return service.listar()
            .stream()
            .sorted(Comparator.comparing(MensajeContacto::getFechaEnvio, Comparator.nullsLast(Comparator.reverseOrder())))
            .toList();
    }

    @PostMapping
    public MensajeContacto guardar(@RequestBody MensajeContacto mensaje) {
        return service.guardar(mensaje);
    }

    @GetMapping("/{id}")
    public MensajeContacto obtener(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    @PutMapping("/{id}/leido")
    public MensajeContacto marcarComoLeido(@PathVariable Long id) {
        return service.marcarComoLeido(id);
    }

    @PutMapping("/{id}/responder")
    public MensajeContacto responder(@PathVariable Long id, @RequestBody MensajeContacto mensaje) {
        return service.responder(id, mensaje.getRespuesta());
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
