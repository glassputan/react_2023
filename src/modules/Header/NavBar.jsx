import React                from "react";
import { 
    useContext
}                           from 'react';

import Container            from 'react-bootstrap/Container'
import Nav                  from 'react-bootstrap/Nav'
import NavDropdown          from 'react-bootstrap/NavDropdown'
import Navbar               from 'react-bootstrap/Navbar'
import {LinkContainer}      from 'react-router-bootstrap'

import { useTranslation }   from 'react-i18next';
import AppContext           from "../../context/AppContext";
import { NavItem } from "react-bootstrap";

const NavBar = (props) => {
    const { t } = useTranslation();

    const context = useContext(AppContext);

    return (
        <Navbar collapseOnSelect className="hsc-yellow" expand="md">
            <Container>
                <Navbar.Brand href="/">HSC</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">             
                        {
                            context.isAdmin &&
                            (
                                <NavDropdown title="Administration">
                                    { /* <NavDropdown.Divider>{t("admin")}</NavDropdown.Divider>        */ }
                                    { /* <NavDropdown.Divider>{t("reports")}</NavDropdown.Divider>      */ }
                                    <NavItem>{t("registration")}</NavItem>
                                    <LinkContainer to="/admin/divisions"><NavDropdown.Item>{t("divisions")}</NavDropdown.Item></LinkContainer>
                                    <LinkContainer to="/admin/games"><NavDropdown.Item>{t("games")}</NavDropdown.Item></LinkContainer>
                                    <LinkContainer to="/admin/households"><NavDropdown.Item>{t("households")}</NavDropdown.Item></LinkContainer>
                                    <LinkContainer to="/admin/members"><NavDropdown.Item>{t("members")}</NavDropdown.Item></LinkContainer>
                                    <LinkContainer to="/admin/teams"><NavDropdown.Item>{t("teams")}</NavDropdown.Item></LinkContainer>
                                    <LinkContainer to="/admin/seasons"><NavDropdown.Item>{t("seasons")}</NavDropdown.Item></LinkContainer>
                                    <LinkContainer to="/admin/sponsors"><NavDropdown.Item>{t("sponsors")}</NavDropdown.Item></LinkContainer>
                                    <NavItem>{t("import")}</NavItem>
                                    <LinkContainer to="/admin/game_schedule"><NavDropdown.Item>{t("game_schedule")}</NavDropdown.Item></LinkContainer>
                                    <LinkContainer to="/admin/import/registrations"><NavDropdown.Item>{t("registrations")}</NavDropdown.Item></LinkContainer>
                                    <LinkContainer to="/admin/import/teams"><NavDropdown.Item>{t("teams")}</NavDropdown.Item></LinkContainer>
                                    <NavItem>{t("website")}</NavItem>
                                    <LinkContainer to="/admin/articles"><NavDropdown.Item>{t("documents")}</NavDropdown.Item></LinkContainer>
                                    <LinkContainer to="/admin/events"><NavDropdown.Item>{t("events")}</NavDropdown.Item></LinkContainer>
                                    <LinkContainer to="/admin/images"><NavDropdown.Item>{t("images")}</NavDropdown.Item></LinkContainer>
                                    <LinkContainer to="/admin/news/articles"><NavDropdown.Item>{t("news_feed")}</NavDropdown.Item></LinkContainer>
                                    <NavItem>{t("system")}</NavItem>
                                    <LinkContainer to="/admin/filters"><NavDropdown.Item>{t("debug")}</NavDropdown.Item></LinkContainer>
                                    <LinkContainer to="/admin/system/jobs"><NavDropdown.Item>{t("system_jobs")}</NavDropdown.Item></LinkContainer>
                                    <LinkContainer to="/admin/system/jobrunner"><NavDropdown.Item>{t("job_runner")}</NavDropdown.Item></LinkContainer>
                                    <LinkContainer to="/admin/system/properties"><NavDropdown.Item>{t("properties")}</NavDropdown.Item></LinkContainer>
                                </NavDropdown>
                            )
                        }
                        <LinkContainer to="/covid"        ><Nav.Link className="nav-link">{ t('covid') }</Nav.Link></LinkContainer>
                        <LinkContainer to="/sponsors"     ><Nav.Link>{t('sponsors')}</Nav.Link></LinkContainer>
                        <LinkContainer to="/travel"       ><Nav.Link className="nav-link">{ t('travel') }</Nav.Link></LinkContainer>
                        <LinkContainer to="/recreational" ><Nav.Link className="nav-link">{ t("recreational") }</Nav.Link></LinkContainer>
                        <LinkContainer to="/standings"    ><Nav.Link className="nav-link">{ t("recreational_team_standings") }</Nav.Link></LinkContainer>
                        <LinkContainer to="/coaching"     ><Nav.Link className="nav-link">{ t("coaches") }</Nav.Link></LinkContainer>
                        <LinkContainer to="/referees"     ><Nav.Link className="nav-link">{ t("referees") }</Nav.Link></LinkContainer>
                    </Nav>  
                    <NavDropdown title={ t('about_us') }>
                        <LinkContainer to="/locations"    ><NavDropdown.Item>{t('locations')}</NavDropdown.Item></LinkContainer>
                        <LinkContainer to="/directors"    ><NavDropdown.Item>{t('board')}</NavDropdown.Item></LinkContainer>
                        <LinkContainer to="/minutes"      ><NavDropdown.Item>{t('minutes')}</NavDropdown.Item></LinkContainer>
                        
                        <NavDropdown.Divider />                        
                        <LinkContainer to="/contact_us"   ><NavDropdown.Item>{t('contact_us')}</NavDropdown.Item></LinkContainer>
                    </NavDropdown>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default NavBar;
