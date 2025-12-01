export interface Grafico {
  stats: Array<{
    date: string;
    tasks: number;
    points: number;
    users: Array<{
      id?: number,
      email: string,
      user: string,
      total_points: number,
      total_actions: number
    }>
  }>
}
