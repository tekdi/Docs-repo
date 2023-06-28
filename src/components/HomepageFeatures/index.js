import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Find docs',
    Svg: require('@site/static/img/loupe-magnifying-glass.svg').default,
    description: (
      <>
        Here you will find comprehensive documentation on installations, upgradations, setpus and various topics related to Devops.
      </>
    ),
  },
  {
    title: 'Knowledge is the key to success',
    Svg: require('@site/static/img/document-svgrepo-com.svg').default,
    description: (
      <>
        Whether you're a fresher or an experienced, this site is designed to provide you with all the information you need.
      </>
    ),
  },
  {
    title: 'take the lead',
    Svg: require('@site/static/img/tekdi.svg').default,
    description: (
      <>
        CATALYSE. DIGITAL. TRANSFORMATION.
         </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
