import styled from 'styled-components';
import Button from '../../components/Button';

export const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--input-border);
  box-shadow: var(--terminal-shadow);

  /* Ajuste no alinhamento do Logo */
  & > :first-child {
    align-self: flex-start;
    margin-bottom: 0 !important;
    width: auto;
  }

  @media (max-width: 768px) {
    padding: 15px;
    flex-direction: column;
    gap: 10px;
  }
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  color: var(--text-color);

  span {
    font-size: 14px;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

export const LogoutButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;

  &:hover {
    color: var(--text-color);
    text-shadow: 0 0 5px var(--text-color);
  }
`;

export const Content = styled.div`
  display: flex;
  flex: 1;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const MainContent = styled.main`
  flex: 1;
  padding: 20px;
  background-color: var(--bg-color);

  .actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 15px;
  }

  h2 {
    font-size: 22px;
    margin-bottom: 20px;
    color: var(--text-color);
    text-shadow: 0 0 5px var(--text-color);
  }
`;

export const UploadButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 15px;
  cursor: pointer;
`;

export const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: var(--card-bg);
  border: 1px solid var(--input-border);
  border-radius: 3px;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--text-color);
    box-shadow: 0 0 5px var(--text-color);
  }

  .file-icon {
    font-size: 24px;
    color: var(--primary-color);
    margin-right: 15px;
  }

  .file-info {
    flex: 1;

    h3 {
      font-size: 16px;
      margin-bottom: 5px;
    }

    p {
      font-size: 12px;
      color: var(--text-secondary);
    }
  }

  .file-actions {
    display: flex;
    gap: 10px;

    button {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s ease;

      &:hover {
        color: var(--text-color);
        text-shadow: 0 0 5px var(--text-color);
      }
    }
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;

    .file-icon {
      margin-right: 0;
      margin-bottom: 10px;
    }

    .file-actions {
      width: 100%;
      justify-content: space-around;
    }
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  text-align: center;

  i {
    font-size: 48px;
    color: var(--text-secondary);
    margin-bottom: 20px;
  }

  p {
    margin-bottom: 20px;
    color: var(--text-secondary);
  }
`;
