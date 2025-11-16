import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Button,
    Box,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <AppBar
                position="static"
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
            >
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        Air Quality Monitoring
                    </Typography>
                    <Button
                        color="inherit"
                        component={Link}
                        to="/"
                        sx={{
                            mx: 1,
                            backgroundColor: isActive('/') ? 'rgba(255,255,255,0.2)' : 'transparent',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        Map
                    </Button>
                    <Button
                        color="inherit"
                        component={Link}
                        to="/import"
                        sx={{
                            mx: 1,
                            backgroundColor: isActive('/import') ? 'rgba(255,255,255,0.2)' : 'transparent',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        Data Import
                    </Button>
                    <Button
                        color="inherit"
                        component={Link}
                        to="/reports"
                        sx={{
                            mx: 1,
                            backgroundColor: isActive('/reports') ? 'rgba(255,255,255,0.2)' : 'transparent',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        Reports
                    </Button>
                </Toolbar>
            </AppBar>
            <Container maxWidth="xl" sx={{ mt: 3, pb: 3 }}>
                {children}
            </Container>
        </Box>
    );
};