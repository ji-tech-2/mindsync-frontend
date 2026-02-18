import { useAuth } from '@/features/auth';
import { Button, Card } from '@/components';
import logoPrimaryAlt from '@/assets/logo-primary-alt.svg';
import styles from './Home.module.css';

export default function Home() {
  const { user, isLoading } = useAuth();

  // Show nothing while checking auth status
  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <img
            src={logoPrimaryAlt}
            alt="MindSync Logo"
            className={styles.heroLogo}
          />
          <h1 className={styles.heroTitle}>Your Mental Health Companion</h1>
          <p className={styles.heroSubtitle}>
            Take control of your mental well-being with personalized screening
            and data-backed recommendations
          </p>
          <div className={styles.heroCtas}>
            <Button
              variant="filled"
              size="lg"
              href={user ? '/dashboard' : '/signup'}
            >
              {user ? 'Go to Dashboard' : 'Get Started'}
            </Button>
            <Button variant="filled" size="lg" href="/screening">
              Try Screening
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Features Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>How MindSync Helps You</h2>
            <p className={styles.sectionDescription}>
              Our evidence-based approach combines professional screening tools
              with personalized insights to support your mental health journey
            </p>
          </section>

          <div className={styles.featuresGrid}>
            <Card>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🧠</div>
                <h3 className={styles.featureTitle}>Professional Screening</h3>
                <p className={styles.featureDescription}>
                  Access validated mental health assessments used by healthcare
                  professionals worldwide
                </p>
              </div>
            </Card>

            <Card>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>📊</div>
                <h3 className={styles.featureTitle}>Track Progress</h3>
                <p className={styles.featureDescription}>
                  Monitor your mental health journey with visual insights and
                  weekly trends
                </p>
              </div>
            </Card>

            <Card>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>💡</div>
                <h3 className={styles.featureTitle}>Personalized Advice</h3>
                <p className={styles.featureDescription}>
                  Receive tailored recommendations based on your unique
                  screening results
                </p>
              </div>
            </Card>
          </div>

          {/* Why Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Why Mental Health Matters</h2>
            <p className={styles.sectionDescription}>
              Mental health is just as important as physical health. Regular
              screening helps identify concerns early, track improvements, and
              maintain overall well-being. Start your journey today with a
              quick, confidential assessment.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
