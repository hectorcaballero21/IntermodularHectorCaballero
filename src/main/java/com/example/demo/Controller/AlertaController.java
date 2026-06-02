package com.example.demo.Controller;

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

import com.example.demo.Entity.Alerta;
import com.example.demo.Services.AlertaService;

@RestController
@RequestMapping("/alertas")
@CrossOrigin(origins = "*")
public class AlertaController {

    @Autowired
    private AlertaService service;

    @GetMapping
    public List<Alerta> listar() {
        return service.listar();
    }

    @PostMapping
    public Alerta guardar(@RequestBody Alerta alerta) {
        return service.guardar(alerta);
    }

    @GetMapping("/{id}")
    public Alerta obtener(@PathVariable Integer id) {
        return service.obtenerPorId(id);
    }

    @PutMapping("/{id}")
    public Alerta actualizar(@PathVariable Integer id, @RequestBody Alerta alerta) {
        return service.actualizar(id, alerta);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        service.eliminar(id);
    }
}
