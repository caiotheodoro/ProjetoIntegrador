import * as React from 'react';
import ProductCategories from '../components/Views/ProductCategories';
import ProductHowItWorks from '../components/Views/ProductHowItWorks';
import ServiceAddress from '../components/Views/ServiceAddress';
import Head from 'next/head'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer';
import { createStyles, makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'
import { GetStaticProps } from "next";
import { stripe } from "../services/stripe";
interface HomeProps {
  product: {
    priceId: string,
    amount: number,
  }
}
const useStyles = makeStyles((theme: Theme) =>
  createStyles({

    contentContainer: {
      maxWidth: '1120px',
      margin: '0 auto',
      padding: '0 2rem',
      height: 'calc(100vh - 5rem)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  })
);

export default function Home({product} : HomeProps) {
  const classes = useStyles();
  
  return (
    <>
      <Head>
        <title>Home | QuickWash</title>
      </Head>
      <Header />
      
      <React.Fragment>
      <ProductCategories />
      <ProductHowItWorks />
      <ServiceAddress />
      <Footer />
    </React.Fragment>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => { //carrega a pagina uma vez de acordo com o revalidade.
  const price =  await stripe.prices.retrieve("price_1JyP5fDqVzUtyqwcK7kJZdu8"/*, {
    expand: ['product']
  }*/)

  const  product  = {
    priceID: price.id,
    amount: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format( price.unit_amount / 100),
    
  }

  return {
    props: {
      product
    },
    revalidate: 60 * 60 * 24, //24 horas - tempo de revalidacao (reconstrução da pagina)
  };
}