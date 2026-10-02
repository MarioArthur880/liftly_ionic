export interface MensagemModel {
  id: string;
  grupoId: string;
  autorId: string;
  autorNome: string;
  texto: string;
  imagem?: string | null;
  dataEnvio: string;
}
