package com.example.demo.Services.Implementation;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.Entity.Alerta;
import com.example.demo.Repository.AlertaRepository;
import com.example.demo.Services.AlertaService;

@Service
public class AlertaServiceImpl implements AlertaService {

    @Autowired
    private AlertaRepository repository;

    @Override
    public List<Alerta> listar() {
        return repository.findAll();
    }

    @Override
    public Alerta guardar(Alerta alerta) {
        return repository.save(alerta);
    }

    @Override
    public Alerta obtenerPorId(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public Alerta actualizar(Integer id, Alerta alerta) {
        Alerta alertaExistente = repository.findById(id).orElse(null);

        if (alertaExistente == null) {
            return null;
        }

        alertaExistente.setTipo(alerta.getTipo());
        alertaExistente.setTitulo(alerta.getTitulo());
        alertaExistente.setTexto(alerta.getTexto());
        alertaExistente.setActiva(alerta.getActiva());

        return repository.save(alertaExistente);
    }

    @Override
    public void eliminar(Integer id) {
        repository.deleteById(id);
    }
}
