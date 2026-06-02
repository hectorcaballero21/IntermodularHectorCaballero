package com.example.demo.Services.Implementation;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.Entity.Cita;
import com.example.demo.Repository.CitaRepository;
import com.example.demo.Services.CitaService;

@Service
public class CitaServiceImpl implements CitaService {

    @Autowired
    private CitaRepository repository;

    @Override
    public List<Cita> listar() {
        return repository.findAll();
    }

    @Override
    public Cita guardar(Cita cita) {
        return repository.save(cita);
    }

    @Override
    public Cita actualizar(Integer id, Cita cita) {
        Cita citaExistente = repository.findById(id).orElse(null);

        if (citaExistente == null) {
            return null;
        }

        citaExistente.setFecha(cita.getFecha());
        citaExistente.setHora(cita.getHora());
        citaExistente.setMotivo(cita.getMotivo());
        citaExistente.setEstado(cita.getEstado());
        citaExistente.setPaciente(cita.getPaciente());
        citaExistente.setUsuario(cita.getUsuario());
        citaExistente.setDiagnostico(cita.getDiagnostico());
        citaExistente.setTratamiento(cita.getTratamiento());

        return repository.save(citaExistente);
    }

    @Override
    public Cita obtenerPorId(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public void eliminar(Integer id) {
        repository.deleteById(id);
    }
}