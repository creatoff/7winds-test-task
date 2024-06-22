import { ReactNode } from 'react';
import AppsIcon from '@mui/icons-material/Apps';
import ReplyIcon from '@mui/icons-material/Reply';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './Layout.styles.scss';

const categoryList = [
    'По проекту',
    'Объекты',
    'РД',
    'МТО',
    'График',
    'МиМ',
    'Рабочие',
    'Капвложения',
    'Бюджет',
    'Финансирование',
    'Панорамы',
    'Камеры',
    'Поручения',
    'Контрагенты',
];

export function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="layout">
            <header className="header">
                <div className="header__menu">
                    <div className="header__button">
                        <AppsIcon />
                    </div>
                    <div className="header__button">
                        <ReplyIcon />
                    </div>
                </div>
                <nav className="header__menu">
                    <a
                        href="#"
                        className="header__menu-item header__menu-item_active"
                    >
                        Просмотр
                    </a>
                    <a href="#" className="header__menu-item">
                        Управление
                    </a>
                </nav>
            </header>
            <div className="layout__body">
                <aside className="sidebar">
                    <div className="project-select">
                        <div className="project-select__label">
                            <div className="project-select__title">
                                Название проекта
                            </div>
                            <div className="project-select__description">
                                Аббревиатура
                            </div>
                        </div>
                        <ExpandMoreIcon />
                    </div>
                    <ul className="category-list">
                        {categoryList.map((category) => (
                            <li key={category} className="category-list__item">
                                <DashboardIcon sx={{ fontSize: 22 }} />
                                {category}
                            </li>
                        ))}
                    </ul>
                </aside>
                <main className="main">
                    <div className="tabs">
                        <div className="tabs__list">
                            <div className="tabs__list-item">
                                Строительно-монтажные работы
                            </div>
                        </div>
                        <div className="tabs__content">{children}</div>
                    </div>
                </main>
            </div>
        </div>
    );
}
