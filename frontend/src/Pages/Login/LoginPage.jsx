import React from 'react';
import LoginStats from '../../components/login/LoginStats';
import LoginForm from '../../components/login/LoginForm';
import Footer from '../../components/Footer';

const LoginPage = () => {
  return (
    <div className="login-container">
      <main className="login-main">
        <LoginStats />
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
