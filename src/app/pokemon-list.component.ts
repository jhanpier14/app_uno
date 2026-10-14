import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pokemon, PokemonService } from './pokemon.service';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="pokedex">
      <h1>Pokédex</h1>

      <div class="search-box">
        <input
          type="text"
          placeholder="Buscar por nombre o ID"
          [(ngModel)]="searchTerm"
          (keyup.enter)="search()"
          class="search-input"
        />
        <button class="search-btn" (click)="search()">Buscar</button>
        <button class="clear-btn" (click)="clear()">Limpiar</button>
      </div>

      <p *ngIf="loading" class="message">Cargando Pokémones...</p>
      <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>
      <p *ngIf="!loading && !errorMessage && pokemons.length === 0" class="message">
        No se encontraron Pokémones.
      </p>

      <div class="grid">
        <div class="card" *ngFor="let p of pokemons; trackBy: trackById">
          <img [src]="p.spriteUrl" [alt]="p.name" class="sprite" />
          <h3>#{{ p.id }} - {{ p.name | titlecase }}</h3>
          <p>Altura: {{ p.height / 10 }} m</p>
          <p>Peso: {{ p.weight / 10 }} kg</p>
          <p>Exp. base: {{ p.baseExperience }}</p>
          <p>
            Tipos:
            <span
              class="type-badge"
              *ngFor="let t of p.types; let i = index"
              [attr.data-type]="t.typeName"
            >
              {{ t.typeName }}{{ i < p.types.length - 1 ? ', ' : '' }}
            </span>
          </p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .pokedex {
      font-family: system-ui, sans-serif;
      max-width: 1100px;
      margin: 0 auto;
      padding: 1rem;
    }
    h1 {
      text-align: center;
      color: #d32f2f;
    }
    .search-box {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      margin: 1rem 0;
      flex-wrap: wrap;
    }
    .search-input {
      padding: 0.5rem 1rem;
      font-size: 1rem;
      border: 2px solid #d32f2f;
      border-radius: 4px;
      min-width: 240px;
    }
    .search-btn,
    .clear-btn {
      padding: 0.5rem 1.25rem;
      font-size: 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      color: #fff;
    }
    .search-btn { background: #d32f2f; }
    .clear-btn { background: #757575; }
    .search-btn:hover { background: #b71c1c; }
    .clear-btn:hover { background: #616161; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    .card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
      background: #fafafa;
      transition: box-shadow 0.2s;
    }
    .card:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
    .sprite { width: 96px; height: 96px; image-rendering: pixelated; }
    .type-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      color: #fff;
      font-size: 0.85rem;
      text-transform: capitalize;
      background: #90a4ae;
    }
    .message { text-align: center; color: #555; }
    .error { text-align: center; color: #d32f2f; font-weight: bold; }
  `]
})
export class PokemonListComponent implements OnInit {
  pokemons: Pokemon[] = [];
  searchTerm = '';
  loading = false;
  errorMessage = '';

  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.loadPokemons();
  }

  loadPokemons(): void {
    this.loading = true;
    this.errorMessage = '';
    this.pokemonService.getPokemons(20).subscribe({
      next: (data) => {
        this.pokemons = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los Pokémones. Verifica tu conexión.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  search(): void {
    const term = this.searchTerm.trim();
    if (!term) {
      this.loadPokemons();
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.pokemonService.searchPokemon(term).subscribe({
      next: (pokemon) => {
        this.pokemons = pokemon ? [pokemon] : [];
        this.loading = false;
        if (!pokemon) {
          this.errorMessage = `No se encontró ningún Pokémon llamado "${term}".`;
        }
      },
      error: (err) => {
        this.errorMessage = `No se encontró ningún Pokémon llamado "${term}".`;
        this.loading = false;
        console.error(err);
      }
    });
  }

  clear(): void {
    this.searchTerm = '';
    this.loadPokemons();
  }

  trackById(index: number, pokemon: Pokemon): number {
    return pokemon.id;
  }
}
