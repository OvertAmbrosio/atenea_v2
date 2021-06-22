export const Nav30DataSource = {
  wrapper: { className: 'header3 home-page-wrapper jzih1dpqqrg-editor_css' },
  page: { className: 'home-page' },
  logo: {
    className: 'header3-logo jzjgnya1gmn-editor_css',
    children:
      './iconL.png',
  },
};
export const Banner50DataSource = {
  wrapper: { className: 'home-page-wrapper banner5' },
  page: { className: 'home-page banner5-page' },
  childWrapper: {
    className: 'banner5-title-wrapper',
    children: [
      { name: 'title', children: 'Atenea System', className: 'banner5-title' },
      {
        name: 'explain',
        className: 'banner5-explain',
        children: 'Sistema de Gestión',
      },
      {
        name: 'content',
        className: 'banner5-content',
        children: 'Por favor selecciona la plataforma:',
      },
      {
        name: 'button',
        className: 'banner5-button-wrapper',
        children: {
          href: '/login',
          className: 'banner5-button kq3z6k1t9z-editor_css',
          type: 'primary',
          children: 'Web',
        },
      },
      {
        name: 'button',
        className: 'banner5-button-wrapper',
        children: {
          href: 'https://play.google.com/store/apps/details?id=com.liteyca.AteneaApp',
          className: 'banner5-button kq3yrexvns7-editor_css',
          type: 'primary',
          children: 'Android',
        },
      },
    ],
  },
  image: {
    className: 'banner5-image',
    children:
      'https://gw.alipayobjects.com/mdn/rms_ae7ad9/afts/img/A*-wAhRYnWQscAAAAAAAAAAABkARQnAQ',
  },
};
