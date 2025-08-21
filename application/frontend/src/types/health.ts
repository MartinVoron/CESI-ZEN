// Types pour les contenus de santé
export interface ContenuSante {
  id: string
  titre: string
  texte: string
  date_creation?: string
  date_mise_a_jour?: string
}

export interface ContenuSanteResponse {
  success: boolean
  data: ContenuSante[]
  error?: string
} 