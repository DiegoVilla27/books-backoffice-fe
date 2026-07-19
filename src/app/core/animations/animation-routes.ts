import { animate, query, style, transition, trigger } from '@angular/animations';

/**
 * Animación de transición de rutas que aplica un efecto de desvanecimiento (Fade-In)
 * al detectar un cambio en el árbol de enrutamiento.
 */
export const routeFadeInAnimation = trigger('routeAnimations', [
  // Esta regla aplica cuando cambias de CUALQUIER ruta a OTRA (* => *)
  transition('* => *', [
    // 1. Buscamos el componente que entra (:enter)
    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateY(4px)' // Un sutil empuje hacia arriba para darle dinamismo
      })
    ], { optional: true }),

    // 2. Ejecutamos la animación de transición
    query(':enter', [
      animate('250ms cubic-bezier(0.4, 0, 0.2, 1)', style({
        opacity: 1,
        transform: 'translateY(0)'
      }))
    ], { optional: true })
  ])
]);