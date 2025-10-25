<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quantity' => $this->quantity,
            
            // Data Snapshot
            'snapshot_book_title' => $this->snapshot_book_title,
            'snapshot_price_per_item' => $this->snapshot_price_per_item,
            
            // (Opsional) Sertakan data buku jika relasinya di-load
            'book' => new BookResource($this->whenLoaded('book')),
        ];
    }
}