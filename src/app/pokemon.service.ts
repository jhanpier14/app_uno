import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, switchMap } from 'rxjs';

export interface PokemonType {
  slot: number;
  typeName: string;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  baseExperience: number;
  spriteUrl: string;
  types: PokemonType[];
}

interface PokemonListResponse {
  results: Array<{ name: string; url: string }>;
}

interface PokemonDetailResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: { front_default: string };
  types: Array<{ slot: number; type: { name: string } }>;
}

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private apiBase = 'https://pokeapi.co/api/v2/pokemon';

  constructor(private http: HttpClient) {}

  getPokemons(limit: number = 20, offset: number = 0): Observable<Pokemon[]> {
    return this.http
      .get<PokemonListResponse>(`${this.apiBase}?limit=${limit}&offset=${offset}`)
      .pipe(
        switchMap((data) =>
          forkJoin(
            data.results.map((p) =>
              this.http.get<PokemonDetailResponse>(p.url).pipe(
                switchMap((detail) =>
                  this.mapDetail(detail)
                )
              )
            )
          )
        )
      );
  }

  searchPokemon(term: string): Observable<Pokemon | null> {
    return this.http
      .get<PokemonDetailResponse>(`${this.apiBase}/${term.toLowerCase()}`)
      .pipe(
        switchMap((detail) => this.mapDetail(detail)),
        // Si falla (404), devolvemos null
        switchMap((pokemon) => new Observable<Pokemon | null>((observer) => {
          observer.next(pokemon);
          observer.complete();
        }))
      );
  }

  private mapDetail(detail: PokemonDetailResponse): Observable<Pokemon> {
    return new Observable<Pokemon>((observer) => {
      observer.next({
        id: detail.id,
        name: detail.name,
        height: detail.height,
        weight: detail.weight,
        baseExperience: detail.base_experience,
        spriteUrl: detail.sprites.front_default,
        types: detail.types.map((t) => ({
          slot: t.slot,
          typeName: t.type.name
        }))
      });
      observer.complete();
    });
  }
}
