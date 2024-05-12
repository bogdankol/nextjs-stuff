'use client'
import Image from 'next/image'
import s from './styles.module.css'
import useWindowWidth from './useWindowWidth'

export default function Page() {
  const pathToImages = [
    '/imgForCarusel/carusel-1.jpg',
    '/imgForCarusel/carusel-2.jpg',
    '/imgForCarusel/carusel-3.jpg',
    '/imgForCarusel/carusel-4.jpg',
    '/imgForCarusel/carusel-5.jpg',
  ]

  const screenWidth = useWindowWidth()

  return <section className={s.section}>

    <div className={s.wrapper}>

      <div className={s.caruselDiv} style={{width: screenWidth * pathToImages.length * 0.8 + 'px'}}>

        {pathToImages.map((el: string, idx: number) => {
          return <div className={s.item} key={idx} style={{backgroundImage: `url(${el})`, width: `100%`}}>

            <div className={s.innerDiv}>
              <h2>This is tile</h2>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati cupiditate sequi iste nulla maiores expedita eum error quia voluptate libero enim, eaque inventore incidunt laboriosam veniam, fuga rerum aliquid qui.</p>
              <button>press me!</button>
            </div>
          </div>
        })}

      </div>

    </div>

  </section>
}