import { useCallback } from 'react';
import { useCanvasStore } from '../store/useStore';
import { CardService } from '../services/cardService';
import { PositionUtils } from '../utils/positionUtils';
import { CONSTANTS } from '../utils/constants';
import { Card, Position } from '../types';

/**
 * 카드 관련 비즈니스 로직을 담은 커스텀 훅
 * Store와 Service 레이어를 연결
 */
export const useCards = () => {
  const cards = useCanvasStore(state => state.cards);
  const viewport = useCanvasStore(state => state.viewport);
  const addCardToStore = useCanvasStore(state => state.addCard);
  const updateCardInStore = useCanvasStore(state => state.updateCard);
  const deleteCardFromStore = useCanvasStore(state => state.deleteCard);
  const setCards = useCanvasStore(state => state.setCards);
  const bringCardToFront = useCanvasStore(state => state.bringCardToFront);
  const bringCardForward = useCanvasStore(state => state.bringCardForward);
  const sendCardBackward = useCanvasStore(state => state.sendCardBackward);

  /**
   * 새 카드 추가
   */
  const addCard = useCallback((position?: Position) => {
    if (!CardService.canAdd(cards.length)) {
      return { success: false, error: 'MAX_CARDS_REACHED' };
    }

    const centerPosition = position || PositionUtils.centerInViewport(
      viewport,
      { width: CONSTANTS.DEFAULT_CARD_WIDTH, height: CONSTANTS.DEFAULT_CARD_HEIGHT }
    );

    addCardToStore({ position: centerPosition });
    return { success: true };
  }, [cards.length, viewport, addCardToStore]);

  /**
   * 카드 업데이트
   */
  const updateCard = useCallback((id: number, updates: Partial<Card>) => {
    updateCardInStore(id, updates);
  }, [updateCardInStore]);

  /**
   * 카드 삭제
   */
  const deleteCard = useCallback((id: number) => {
    deleteCardFromStore(id);
  }, [deleteCardFromStore]);

  /**
   * 카드를 맨 앞으로
   */
  const bringToFront = useCallback((id: number) => {
    bringCardToFront(id);
  }, [bringCardToFront]);

  /**
   * 레이어 한 단계 올리기
   */
  const bringForward = useCallback((id: number) => {
    bringCardForward(id);
  }, [bringCardForward]);

  /**
   * 레이어 한 단계 내리기
   */
  const sendBackward = useCallback((id: number) => {
    sendCardBackward(id);
  }, [sendCardBackward]);

  /**
   * 여러 카드를 함께 이동
   */
  const moveMultiple = useCallback((selectedIds: Set<number>, delta: Position) => {
    const movedCards = CardService.moveMultiple(cards, selectedIds, delta, viewport);
    setCards(movedCards);
  }, [cards, viewport, setCards]);

  /**
   * 카드 복제
   */
  const cloneCard = useCallback((id: number) => {
    const card = cards.find(c => c.id === id);
    if (!card) return { success: false, error: 'CARD_NOT_FOUND' };

    if (!CardService.canAdd(cards.length)) {
      return { success: false, error: 'MAX_CARDS_REACHED' };
    }

    const clonedCard = CardService.clone(card);
    addCardToStore(clonedCard);
    return { success: true };
  }, [cards, addCardToStore]);

  /**
   * viewport 변경 시 모든 카드 위치 조정
   */
  const scaleToViewport = useCallback((oldViewport: typeof viewport, newViewport: typeof viewport) => {
    const scaledCards = CardService.scaleMultiple(cards, oldViewport, newViewport);
    setCards(scaledCards);
  }, [cards, setCards]);

  /**
   * 카드 유효성 검증
   */
  const validateCard = useCallback((card: Partial<Card>) => {
    return CardService.validate(card);
  }, []);

  /**
   * 빈 카드 확인
   */
  const isEmpty = useCallback((id: number) => {
    const card = cards.find(c => c.id === id);
    return card ? CardService.isEmpty(card) : true;
  }, [cards]);

  /**
   * 카드 정렬
   */
  const sortCards = useCallback(() => {
    const sorted = CardService.sortByPosition(cards);
    setCards(sorted);
  }, [cards, setCards]);

  return {
    cards,
    addCard,
    updateCard,
    deleteCard,
    bringToFront,
    bringForward,
    sendBackward,
    moveMultiple,
    cloneCard,
    scaleToViewport,
    validateCard,
    isEmpty,
    sortCards,
  };
};
