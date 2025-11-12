import { useCallback } from 'react';
import { useStickerStore } from '../store/useStore';
import { StickerService } from '../services/stickerService';
import { Sticker, StickerInstance, Position, Size } from '../types';

/**
 * 스티커 관련 비즈니스 로직을 담은 커스텀 훅
 * Store와 Service 레이어를 연결
 */
export const useStickers = () => {
  const palette = useStickerStore(state => state.palette);
  const instances = useStickerStore(state => state.instances);
  const addStickerToStore = useStickerStore(state => state.addSticker);
  const deleteStickerFromStore = useStickerStore(state => state.deleteSticker);
  const setStickers = useStickerStore(state => state.setStickers);
  const addInstanceToStore = useStickerStore(state => state.addInstance);
  const updateInstanceInStore = useStickerStore(state => state.updateInstance);
  const deleteInstanceFromStore = useStickerStore(state => state.deleteInstance);
  const setInstances = useStickerStore(state => state.setInstances);
  const bringInstanceToFront = useStickerStore(state => state.bringInstanceToFront);

  /**
   * 새 스티커 추가 (팔레트에)
   */
  const addSticker = useCallback((imageUrl: string, name?: string) => {
    if (!StickerService.canAddSticker(palette.length)) {
      return { success: false, error: 'MAX_STICKERS_REACHED' };
    }

    const newSticker = StickerService.createSticker(imageUrl, name);
    addStickerToStore(newSticker);
    return { success: true, sticker: newSticker };
  }, [palette.length, addStickerToStore]);

  /**
   * 스티커 삭제 (팔레트에서)
   */
  const deleteSticker = useCallback((id: string) => {
    deleteStickerFromStore(id);

    // 해당 스티커로 만든 인스턴스도 모두 삭제
    const instancesToDelete = StickerService.findInstancesByStickerId(instances, id);
    instancesToDelete.forEach(inst => deleteInstanceFromStore(inst.id));
  }, [deleteStickerFromStore, instances, deleteInstanceFromStore]);

  /**
   * 스티커 인스턴스 생성 (캔버스에 배치)
   */
  const createInstance = useCallback((stickerId: string, imageUrl: string, position: Position) => {
    const newInstance = StickerService.createInstance(stickerId, imageUrl, position, instances.length);
    addInstanceToStore(newInstance);
    return { success: true, instance: newInstance };
  }, [instances.length, addInstanceToStore]);

  /**
   * 인스턴스 위치 업데이트
   */
  const updateInstancePosition = useCallback((id: string, position: Position) => {
    updateInstanceInStore(id, { position });
  }, [updateInstanceInStore]);

  /**
   * 인스턴스 크기 변경
   */
  const resizeInstance = useCallback((id: string, size: Size) => {
    const instance = instances.find(inst => inst.id === id);
    if (!instance) return;

    const resized = StickerService.resizeInstance(instance, size);
    updateInstanceInStore(id, { size: resized.size });
  }, [instances, updateInstanceInStore]);

  /**
   * 인스턴스 삭제
   */
  const deleteInstance = useCallback((id: string) => {
    deleteInstanceFromStore(id);
  }, [deleteInstanceFromStore]);

  /**
   * 인스턴스를 맨 앞으로
   */
  const bringToFront = useCallback((id: string) => {
    bringInstanceToFront(id);
  }, [bringInstanceToFront]);

  /**
   * 여러 인스턴스를 함께 이동
   */
  const moveMultiple = useCallback((selectedIds: Set<string>, delta: Position) => {
    const movedInstances = StickerService.moveMultiple(instances, selectedIds, delta);
    setInstances(movedInstances);
  }, [instances, setInstances]);

  /**
   * 인스턴스 복제
   */
  const cloneInstance = useCallback((id: string) => {
    const instance = instances.find(inst => inst.id === id);
    if (!instance) return { success: false, error: 'INSTANCE_NOT_FOUND' };

    const cloned = StickerService.cloneInstance(instance);
    const newInstance = {
      ...cloned,
      id: `sticker_inst_${Date.now()}`,
    };
    addInstanceToStore(newInstance);
    return { success: true, instance: newInstance };
  }, [instances, addInstanceToStore]);

  /**
   * 기본 스티커만 가져오기
   */
  const getPremadeStickers = useCallback(() => {
    return StickerService.filterPremade(palette);
  }, [palette]);

  /**
   * 사용자 추가 스티커만 가져오기
   */
  const getCustomStickers = useCallback(() => {
    return StickerService.filterCustom(palette);
  }, [palette]);

  /**
   * 특정 스티커의 모든 인스턴스 가져오기
   */
  const getInstancesByStickerId = useCallback((stickerId: string) => {
    return StickerService.findInstancesByStickerId(instances, stickerId);
  }, [instances]);

  return {
    palette,
    instances,
    addSticker,
    deleteSticker,
    createInstance,
    updateInstancePosition,
    resizeInstance,
    deleteInstance,
    bringToFront,
    moveMultiple,
    cloneInstance,
    getPremadeStickers,
    getCustomStickers,
    getInstancesByStickerId,
  };
};
