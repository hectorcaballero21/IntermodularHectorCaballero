package com.example.demo.Services;

import java.util.List;

import com.example.demo.Entity.Usuario;

public interface UsuarioService {

    List<Usuario> listar();

    Usuario guardar(Usuario usuario);

    Usuario obtenerPorId(Integer id);

    void eliminar(Integer id);
}