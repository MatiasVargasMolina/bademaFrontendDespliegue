import { Outlet, useParams } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = ({ toggleDarkMode, darkMode }) => {
    const params = useParams();

    return (
        <>
            <Navbar
                params={params}
                toggleDarkMode={toggleDarkMode}
                darkMode={darkMode}
            />
            <Outlet />
        </>
    );
};

export default Layout;