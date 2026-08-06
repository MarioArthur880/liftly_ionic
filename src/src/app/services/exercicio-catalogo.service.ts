import { Injectable } from '@angular/core';
import { ExercicioCatalogoModel } from '../model/exercicio-catalogo.model';

// Catálogo fixo simulando dados cadastrados pelos admins no banco
const CATALOGO: ExercicioCatalogoModel[] = [
  // Peito
  { id: 'e01', nome: 'Supino Reto', grupoMuscular: 'Peito', descricao: 'Exercício básico para peitoral maior', equipamento: 'Barra' },
  { id: 'e02', nome: 'Supino Inclinado', grupoMuscular: 'Peito', descricao: 'Foco na parte superior do peitoral', equipamento: 'Barra' },
  { id: 'e03', nome: 'Supino Declinado', grupoMuscular: 'Peito', descricao: 'Foco na parte inferior do peitoral', equipamento: 'Barra' },
  { id: 'e04', nome: 'Crucifixo', grupoMuscular: 'Peito', descricao: 'Isolamento do peitoral', equipamento: 'Halteres' },
  { id: 'e05', nome: 'Crossover', grupoMuscular: 'Peito', descricao: 'Finalização do peitoral no cabo', equipamento: 'Cabo' },
  { id: 'e06', nome: 'Peck Deck', grupoMuscular: 'Peito', descricao: 'Isolamento do peitoral na máquina', equipamento: 'Máquina' },

  // Costas
  { id: 'e07', nome: 'Puxada Frontal', grupoMuscular: 'Costas', descricao: 'Latíssimo do dorso com pulley', equipamento: 'Cabo' },
  { id: 'e08', nome: 'Remada Curvada', grupoMuscular: 'Costas', descricao: 'Espessura das costas com barra', equipamento: 'Barra' },
  { id: 'e09', nome: 'Remada Unilateral', grupoMuscular: 'Costas', descricao: 'Remada com halter em apoio', equipamento: 'Halteres' },
  { id: 'e10', nome: 'Levantamento Terra', grupoMuscular: 'Costas', descricao: 'Exercício composto para costas e posterior', equipamento: 'Barra' },
  { id: 'e11', nome: 'Pull-up', grupoMuscular: 'Costas', descricao: 'Barra fixa com peso corporal', equipamento: 'Peso Corporal' },
  { id: 'e12', nome: 'Serrote', grupoMuscular: 'Costas', descricao: 'Remada unilateral apoiado no banco', equipamento: 'Halteres' },

  // Ombros
  { id: 'e13', nome: 'Desenvolvimento com Barra', grupoMuscular: 'Ombros', descricao: 'Press militar para deltóide', equipamento: 'Barra' },
  { id: 'e14', nome: 'Desenvolvimento com Halteres', grupoMuscular: 'Ombros', descricao: 'Press para deltóide com halteres', equipamento: 'Halteres' },
  { id: 'e15', nome: 'Elevação Lateral', grupoMuscular: 'Ombros', descricao: 'Isolamento do deltóide lateral', equipamento: 'Halteres' },
  { id: 'e16', nome: 'Elevação Frontal', grupoMuscular: 'Ombros', descricao: 'Isolamento do deltóide anterior', equipamento: 'Halteres' },
  { id: 'e17', nome: 'Remada Alta', grupoMuscular: 'Ombros', descricao: 'Deltóide e trapézio com barra', equipamento: 'Barra' },

  // Bíceps
  { id: 'e18', nome: 'Rosca Direta', grupoMuscular: 'Bíceps', descricao: 'Exercício básico para bíceps', equipamento: 'Barra' },
  { id: 'e19', nome: 'Rosca Alternada', grupoMuscular: 'Bíceps', descricao: 'Rosca com halteres alternando os braços', equipamento: 'Halteres' },
  { id: 'e20', nome: 'Rosca Martelo', grupoMuscular: 'Bíceps', descricao: 'Ênfase no braquial e braquiorradial', equipamento: 'Halteres' },
  { id: 'e21', nome: 'Rosca Scott', grupoMuscular: 'Bíceps', descricao: 'Isolamento do bíceps no banco Scott', equipamento: 'Barra' },
  { id: 'e22', nome: 'Rosca Concentrada', grupoMuscular: 'Bíceps', descricao: 'Pico do bíceps sentado', equipamento: 'Halteres' },

  // Tríceps
  { id: 'e23', nome: 'Tríceps Pulley', grupoMuscular: 'Tríceps', descricao: 'Extensão de tríceps no cabo', equipamento: 'Cabo' },
  { id: 'e24', nome: 'Tríceps Francês', grupoMuscular: 'Tríceps', descricao: 'Extensão acima da cabeça', equipamento: 'Halteres' },
  { id: 'e25', nome: 'Tríceps Testa', grupoMuscular: 'Tríceps', descricao: 'Extensão de tríceps deitado', equipamento: 'Barra' },
  { id: 'e26', nome: 'Mergulho', grupoMuscular: 'Tríceps', descricao: 'Flexão entre bancos ou paralelas', equipamento: 'Peso Corporal' },
  { id: 'e27', nome: 'Kickback', grupoMuscular: 'Tríceps', descricao: 'Extensão de tríceps inclinado', equipamento: 'Halteres' },

  // Pernas
  { id: 'e28', nome: 'Agachamento Livre', grupoMuscular: 'Pernas', descricao: 'Exercício rainha para quadríceps e glúteos', equipamento: 'Barra' },
  { id: 'e29', nome: 'Leg Press', grupoMuscular: 'Pernas', descricao: 'Quadríceps e glúteos na máquina', equipamento: 'Máquina' },
  { id: 'e30', nome: 'Extensora', grupoMuscular: 'Pernas', descricao: 'Isolamento do quadríceps', equipamento: 'Máquina' },
  { id: 'e31', nome: 'Flexora', grupoMuscular: 'Pernas', descricao: 'Isolamento do bíceps femoral', equipamento: 'Máquina' },
  { id: 'e32', nome: 'Stiff', grupoMuscular: 'Pernas', descricao: 'Posterior de coxa com barra', equipamento: 'Barra' },
  { id: 'e33', nome: 'Avanço', grupoMuscular: 'Pernas', descricao: 'Lunges para quadríceps e glúteos', equipamento: 'Halteres' },
  { id: 'e34', nome: 'Hack Squat', grupoMuscular: 'Pernas', descricao: 'Agachamento na máquina hack', equipamento: 'Máquina' },

  // Glúteos
  { id: 'e35', nome: 'Hip Thrust', grupoMuscular: 'Glúteos', descricao: 'Empurrada de quadril com barra', equipamento: 'Barra' },
  { id: 'e36', nome: 'Glúteo no Cabo', grupoMuscular: 'Glúteos', descricao: 'Isolamento do glúteo no cabo', equipamento: 'Cabo' },
  { id: 'e37', nome: 'Abdução no Cabo', grupoMuscular: 'Glúteos', descricao: 'Abdução de quadril no cabo', equipamento: 'Cabo' },

  // Abdômen
  { id: 'e38', nome: 'Abdominal Supra', grupoMuscular: 'Abdômen', descricao: 'Contração do reto abdominal', equipamento: 'Peso Corporal' },
  { id: 'e39', nome: 'Abdominal Infra', grupoMuscular: 'Abdômen', descricao: 'Elevação de pernas para abdômen inferior', equipamento: 'Peso Corporal' },
  { id: 'e40', nome: 'Prancha', grupoMuscular: 'Abdômen', descricao: 'Estabilização do core isometricamente', equipamento: 'Peso Corporal' },
  { id: 'e41', nome: 'Abdominal no Cabo', grupoMuscular: 'Abdômen', descricao: 'Crunch no pulley', equipamento: 'Cabo' },

  // Panturrilha
  { id: 'e42', nome: 'Panturrilha em Pé', grupoMuscular: 'Panturrilha', descricao: 'Elevação de calcanhar em pé', equipamento: 'Máquina' },
  { id: 'e43', nome: 'Panturrilha Sentado', grupoMuscular: 'Panturrilha', descricao: 'Elevação de calcanhar sentado', equipamento: 'Máquina' },

  // Antebraços
  { id: 'e44', nome: 'Rosca de Pulso', grupoMuscular: 'Antebraços', descricao: 'Flexão de punho para antebraço', equipamento: 'Barra' },
  { id: 'e45', nome: 'Rosca de Punho Reversa', grupoMuscular: 'Antebraços', descricao: 'Extensão de punho para braquiorradial', equipamento: 'Barra' },
];

@Injectable({
  providedIn: 'root'
})
export class ExercicioCatalogoService {

  listarTodos(): ExercicioCatalogoModel[] {
    return CATALOGO;
  }

  listarPorGrupo(grupo: string): ExercicioCatalogoModel[] {
    return CATALOGO.filter(e => e.grupoMuscular === grupo);
  }

  buscarPorNome(termo: string): ExercicioCatalogoModel[] {
    const t = termo.toLowerCase().trim();
    if (!t) return CATALOGO;
    return CATALOGO.filter(e =>
      e.nome.toLowerCase().includes(t) ||
      e.grupoMuscular.toLowerCase().includes(t)
    );
  }

  listarGrupos(): string[] {
    return [...new Set(CATALOGO.map(e => e.grupoMuscular))];
  }
}
