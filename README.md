# Teste Interfocus

Uma aplicação mobile de gerenciamento de tarefas desenvolvida com React Native e Expo, com autenticação OAuth 2.0 através do Sistema de Autenticação Interfocus (IAS).

## ✨ Principais Funcionalidades

- **Autenticação OAuth 2.0**: Login seguro através do Sistema de Autenticação Interfocus
- **Gerenciamento Pessoal de Tarefas**: Listas de tarefas individuais para cada usuário
- **Geração Automática de Tarefas**: 50 tarefas de exemplo criadas para novos usuários
- **Operações com Tarefas**:
  - Criar novas tarefas com título e descrição
  - Visualizar tarefas ordenadas por data de criação
  - Expandir tarefas para ver detalhes
  - Seleção múltipla de tarefas através de pressão longa
  - Excluir tarefas (com simulação assíncrona de 1 segundo)
  - Marcar tarefas como concluídas
- **Filtragem de Tarefas**: Filtrar por status (abertas, concluídas ou todas)
- **Interface Responsiva**: Interface intuitiva e amigável

## 🔐 Detalhes da Autenticação

A aplicação utiliza autenticação OAuth 2.0 com os seguintes endpoints:

- **Autorização**: `https://ias.interfocus.com.br/authorize`
- **Token**: `https://auth.interfocus.com.br/api/oauth/token`

### Pré-requisitos

- Node.js (última versão LTS)
- Expo CLI
- Simulador iOS ou Emulador Android
- Yarn ou npm

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Nikaum-js/interfocus-app-test.git
cd interfocus-app-test
```

2. Instale as dependências:
```bash
yarn install
# ou
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
  npx expo start 
```

4. Siga as instruções do Expo CLI para executar o aplicativo na plataforma desejada (iOS/Android)

## 🛠️ Stack Técnica

- **Framework Principal**: React Native v0.79.4 com TypeScript
- **Plataforma de Desenvolvimento**: Expo SDK 53
- **Autenticação e Segurança**:
  - OAuth 2.0 com expo-auth-session
  - Armazenamento seguro com expo-secure-store
  - AsyncStorage para persistência de dados
- **UI/UX**:
  - Expo Router para navegação
  - React Native Reanimated para animações
  - Expo Linear Gradient para efeitos visuais
  - Expo Blur para efeitos de vidro
  - Expo Haptics para feedback tátil
  - Fontes personalizadas com Expo Font (Poppins)
- **Gerenciamento de Estado**: Context API do React com hooks personalizados
- **Estilização**: StyleSheet nativo do React Native
- **Desenvolvimento**:
  - ESLint para padronização de código
  - TypeScript para tipagem estática
  - Expo Dev Client para desenvolvimento

## 📱 Estrutura da Aplicação

A aplicação segue uma arquitetura modular com os seguintes componentes principais:

- **Fluxo de Autenticação**: Gerencia a integração OAuth 2.0 com IAS
- **Gerenciamento de Tarefas**: Funcionalidade principal para operações CRUD em tarefas
- **Componentes de UI**: Componentes reutilizáveis para interface consistente
- **Gerenciamento de Estado**: Manipulação centralizada do estado dos dados
- **Navegação**: Navegação e roteamento entre telas
