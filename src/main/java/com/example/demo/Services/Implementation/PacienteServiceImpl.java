package com.example.demo.Services.Implementation;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.Entity.Paciente;
import com.example.demo.Repository.PacienteRepository;
import com.example.demo.Services.PacienteService;

@Service
public class PacienteServiceImpl implements PacienteService {

    @Autowired
    private PacienteRepository repository;

    @Override
    public List<Paciente> listar() {
        return repository.findAll();
    }

    @Override
    public Paciente guardar(Paciente paciente) {
        return repository.save(paciente);
    }

    @Override
    public Paciente actualizar(Integer id, Paciente paciente) {
        Paciente pacienteExistente = repository.findById(id).orElse(null);

        if (pacienteExistente == null) {
            return null;
        }

        pacienteExistente.setNombre(paciente.getNombre());
        pacienteExistente.setApellidos(paciente.getApellidos());
        pacienteExistente.setDni(paciente.getDni());
        pacienteExistente.setTelefono(paciente.getTelefono());
        pacienteExistente.setEmail(paciente.getEmail());
        pacienteExistente.setFechaNacimiento(paciente.getFechaNacimiento());
        pacienteExistente.setDireccion(paciente.getDireccion());
        pacienteExistente.setNumeroSeguridadSocial(paciente.getNumeroSeguridadSocial());
        pacienteExistente.setHistorialClinico(paciente.getHistorialClinico());

        return repository.save(pacienteExistente);
    }

    @Override
    public Paciente obtenerPorId(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public void eliminar(Integer id) {
        repository.deleteById(id);
    }
}
