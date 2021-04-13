import React from 'react';
import { cleanup, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import mockFetch from '../../cypress/mocks/fetch';
import meals from '../../cypress/mocks/meals';
import beefMeals from '../../cypress/mocks/beefMeals';

import renderWithRouter from './helpers/renderWithRouter';
import MainFood from '../containers/MainFood';
import { CATEGORIES_LENGTH_5, MAIN_FOOD_CARD_LENGTH_12 } from '../constants';

// const apiResponse = Promise.resolve({
//   json: () => Promise.resolve(mockData),
//   ok: true,
// });
// const mockedExchange = jest.spyOn(global, 'fetch').mockImplementation(() => apiResponse);
// afterEach(() => jest.clearAllMocks());

beforeAll(() => {
  jest.spyOn(global, 'fetch').mockImplementation(mockFetch);
});

describe('MainFood section', () => {
  beforeEach(cleanup);
  it('should renders Header', () => {
    // act(async () => {
    renderWithRouter(
      <MainFood />,
      {
        route: '/comidas',
      },
    );
    const header = screen.getByTestId('header-container');
    expect(header).toBeInTheDocument();
    // const mainCards = screen.getAllByTestId(/-recipe-card/i);
    // expect(mainCards.length).toBe(MAIN_FOOD_CARD_LENGTH_12);
    // });
  });
  // it('should dropdown Search Menu', () => {
  //   act(() => {
  //     renderWithRouter(
  //       <MainFood />,
  //       {
  //         route: '/comidas',
  //       },
  //     );
  //     const header = screen.getByTestId('header-container');
  //     expect(header).toBeInTheDocument();
  //     // const searchButton = screen.getByTestId('search-top-btn');
  //     // expect(searchButton).toBeInTheDocument();
  //   });
  // });
  it('should renders Footer', async () => {
    const mockTest = jest.spyOn(global, 'fetch').mockImplementation(mockFetch);

    await act(async () => {
      renderWithRouter(
        <MainFood />,
        {
          route: '/comidas',
        },
      );
      const footer = screen.getByTestId('footer');
      expect(footer).toBeInTheDocument();
      expect(mockTest).toBeCalled();
      expect(mockTest).toBeCalledTimes(2);

      const buttons = screen.getAllByRole('button');
      console.log(buttons.length);
      expect(buttons.length).toBe(CATEGORIES_LENGTH_5);

      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
      });
    });
    const mainCards = screen.getAllByTestId(/-recipe-card/i);
    expect(mainCards.length).toBe(MAIN_FOOD_CARD_LENGTH_12);

    mainCards.forEach((card) => {
      expect(card).toBeInTheDocument();
    });

    const buttonAll = screen.getByText(/all/i);
    expect(buttonAll).toBeInTheDocument();

    act(() => {
      userEvent.click(buttonAll);
    });

    // const mainCards = screen.getAllByTestId(/-recipe-card/i);
    mainCards.forEach((card, index) => {
      // console.log(card.childElementCount);
      expect(card.childElementCount).toBe(2);
      // console.log(card.firstChild.src);
      expect(card.firstChild.src).toBe(meals.meals[index].strMealThumb);
      // console.log(card.lastChild.innerHTML);
      expect(card.lastChild.innerHTML.replace('amp;', ''))
        .toEqual(meals.meals[index].strMeal);
    });

    const beefButton = screen.getByRole('button', {
      name: /beef/i,
    });

    // console.log(odinaryDrinkButton);
    await act(async () => {
      userEvent.click(beefButton);
    });

    const mainCardsBeef = screen.getAllByTestId(/-recipe-card/i);
    // console.log(mainCardsOrdinaryDrinks.length);

    mainCardsBeef.forEach((card, index) => {
      // console.log(card.childElementCount);
      expect(card.childElementCount).toBe(2);
      // console.log(card.firstChild.src);
      expect(card.firstChild.src).toBe(beefMeals.meals[index].strMealThumb);
      // console.log(card.lastChild.innerHTML);
      expect(card.lastChild.innerHTML.replace('amp;', ''))
        .toEqual(beefMeals.meals[index].strMeal);
    });
  });
});
